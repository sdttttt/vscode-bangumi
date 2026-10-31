/**
 * Props shared by the placeholder screens.
 *
 * @author sdttttt
 */
interface PlaceholderProps {
    image: string | undefined;
    message: string;
}

/**
 * Full panel placeholder used by the loading and empty screens.
 *
 * It shares the card surface of the week view, so the three screens read as one
 * application instead of three unrelated pages.
 *
 * @author sdttttt
 */
export function Placeholder({ image, message }: PlaceholderProps) {
    return (
        <div class="load">
            <div class="load-card">
                {image ? (
                    <img class="load-image" src={image} alt={message} />
                ) : null}
                <h3 class="load-text">{message}</h3>
            </div>
        </div>
    );
}
