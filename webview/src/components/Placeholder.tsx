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
 * @author sdttttt
 */
export function Placeholder({ image, message }: PlaceholderProps) {
    return (
        <div class="load">
            {image ? (
                <img class="load-image" src={image} alt={message} />
            ) : null}
            <h3>{message}</h3>
        </div>
    );
}
