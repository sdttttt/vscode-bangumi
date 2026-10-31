import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_QUERY } from "@/request/query";
import {
    applyQuery,
    applyTag,
    initialState,
    useAppState,
    withoutQuery,
    withoutTags,
    type AppStore,
} from "@/state/app";

describe("app state transforms", () => {
    it("starts from the default query, the first page and no tags", () => {
        expect(initialState()).toEqual({
            query: DEFAULT_QUERY,
            page: 1,
            tags: new Map(),
        });
    });

    it("merges a patch into the query", () => {
        const next = applyQuery(initialState(), { area: "2" });

        expect(next.query.area).toBe("2");
        expect(next.query.styleId).toBe(DEFAULT_QUERY.styleId);
    });

    it("keeps the untouched parts of the state", () => {
        const state = { ...initialState(), page: 4 };
        const next = applyQuery(state, { area: "2" });

        expect(next.page).toBe(4);
    });

    it("adds and replaces a tag without mutating the previous map", () => {
        const state = applyTag(initialState(), "Area", "2");
        const next = applyTag(state, "Area", "3");

        expect(state.tags.get("Area")).toBe("2");
        expect(next.tags.get("Area")).toBe("3");
    });

    it("drops every tag", () => {
        const state = applyTag(applyTag(initialState(), "A", "1"), "B", "2");

        expect(withoutTags(state).tags.size).toBe(0);
    });

    it("restores the default query and keeps the page", () => {
        const state = applyQuery({ ...initialState(), page: 9 }, { area: "2" });

        expect(withoutQuery(state)).toEqual({
            query: DEFAULT_QUERY,
            page: 9,
            tags: state.tags,
        });
    });
});

describe("useAppState", () => {
    let state: AppStore;

    beforeEach(() => {
        state = useAppState();
    });

    it("exposes the default state", () => {
        expect(state.getState()).toEqual({
            query: DEFAULT_QUERY,
            page: 1,
            tags: new Map(),
        });
    });

    it("writes a query patch", () => {
        state.setQuery({ area: "2", styleId: "10010" });

        expect(state.getQuery().area).toBe("2");
        expect(state.getQuery().styleId).toBe("10010");
    });

    it("restores the default query", () => {
        state.setQuery({ area: "2" });
        state.setPage(3);

        state.resetQuery();

        expect(state.getQuery()).toEqual(DEFAULT_QUERY);
        expect(state.getPage()).toBe(3);
    });

    it("tracks the page", () => {
        state.setPage(4);

        expect(state.getPage()).toBe(4);
    });

    it("records and clears tags", () => {
        state.recordTag("Area", "2");
        state.recordTag("Style", "原创");

        expect([...state.getTags().values()]).toEqual(["2", "原创"]);

        state.clearTags();

        expect(state.getTags().size).toBe(0);
    });

    it("restores the state it was created with", () => {
        state.setQuery({ area: "2" });
        state.setPage(7);
        state.recordTag("Area", "2");

        state.reset();

        expect(state.getState().query).toEqual(DEFAULT_QUERY);
        expect(state.getPage()).toBe(1);
        expect(state.getTags().size).toBe(0);
    });

    it("gives every instance its own state", () => {
        const other = useAppState();

        state.setPage(9);

        expect(other.getPage()).toBe(1);
    });

    it("honours a custom initial state", () => {
        const seeded = useAppState({ ...initialState(), page: 5 });

        expect(seeded.getPage()).toBe(5);
    });
});
