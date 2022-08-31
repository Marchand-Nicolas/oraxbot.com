import { render, unmountComponentAtNode } from "react-dom"
import Image from 'next/image'

export default function popup(title, description, type, datas) {
    if (typeof window === 'undefined') return
    const popupContainer = document.getElementById('popup')
    render(
        <div className={["popup", type].join(" ")}>
            <div className="container">
                <div>
                    {datas && datas.icon ? <Image src={datas.icon.src} height={datas.icon.height} width={datas.icon.width} /> : ""}
                    <h2 style={{marginLeft: datas && datas.icon ? "15px" : 0}}>{title}</h2>
                </div>
                <p className="description">{description}</p>
                {datas && datas.content ? datas.content : ""}
                <button onClick={() => unmountComponentAtNode(document.getElementById("popup"))}>Okay</button>
            </div>
        </div>,
        popupContainer
    )
}