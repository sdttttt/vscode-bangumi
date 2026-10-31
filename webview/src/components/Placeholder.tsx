/**
 * 占位界面共用的属性。
 *
 * @author sdttttt
 */
interface PlaceholderProps {
    image: string | undefined;
    message: string;
}

/**
 * 加载与空态界面使用的整屏占位。
 *
 * 它复用周番视图的卡片表面，三个界面因此看起来是同一个应用，而不是三个互不相干的页面。
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
