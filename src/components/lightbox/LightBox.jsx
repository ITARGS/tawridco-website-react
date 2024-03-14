import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { Lightbox } from "yet-another-react-lightbox";

const LightBox = ({ open, setOpen, images, imageIndex }) => {
    // console.log(images);
    return (
        <Lightbox
            index={imageIndex}
            open={open}
            styles={{
                container: {
                    backgroundColor: "#000000bf"
                }
            }}
            close={() => setOpen(false)}
            slides={images}
            render={{
                buttonNext: images?.length === 1 ? () => null : undefined,
                buttonPrev: images?.length === 1 ? () => null : undefined
            }}
            plugins={[Zoom]}
        />
    );
};

export default LightBox;