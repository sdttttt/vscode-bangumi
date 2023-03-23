/**
 * Tagger
 */
export default new (class Tagger
{
    /**
     * Hit Tag
     *
     * @author sdttttt
     */
    private _tags: Map<string, string> = new Map();

    set tags(value: Map<string, string>)
    {
        this._tags = value;
    }

    get tags(): Map<string, string>
    {
        return this._tags;
    }

    public clear()
    {
        this._tags.clear();
    }
})();
