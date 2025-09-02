import { renderWithRoot, unmountRoot } from "./reactRoot";
import Image from "next/image";

export default function popup(title, description, type, datas = {}) {
  if (typeof window === "undefined") return;
  const popupContainer = document.getElementById("popup");
  renderWithRoot(
    <div className={["popup", type].join(" ")}>
      <div className="container">
        {datas.close && (
          <svg
            className="close"
            onClick={() => unmountRoot(popupContainer)}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        <div>
          {datas && datas.icon ? (
            <Image
              src={datas.icon.src}
              height={datas.icon.height}
              width={datas.icon.width}
            />
          ) : (
            ""
          )}
          <h2 style={{ marginLeft: datas && datas.icon ? "15px" : 0 }}>
            {title}
          </h2>
        </div>
        {typeof description === "string" ? (
          <p className="description">{description}</p>
        ) : (
          description
        )}
        {datas && datas.content ? datas.content : ""}
        {datas.buttons ? (
          <div className="line">
            {datas.buttons.map((button, i) => (
              <button
                className={["button round ", button.className].join(" ")}
                key={"button_" + i}
                onClick={() => {
                  if (button.action) button.action();
                  unmountRoot(popupContainer);
                }}
              >
                {button.name}
              </button>
            ))}
          </div>
        ) : (
          <button
            className="default"
            onClick={() => {
              if (datas.action) datas.action();
              unmountRoot(popupContainer);
            }}
          >
            {datas.customButtonName ? datas.customButtonName : "Okay"}
          </button>
        )}
      </div>
    </div>,
    popupContainer
  );
}
