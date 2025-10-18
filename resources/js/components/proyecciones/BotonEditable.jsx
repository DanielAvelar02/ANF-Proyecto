// components/ui/PurpleButton.jsx
import React from "react";

export default function BotonEditable({
    children,
    onClick,
    htmlType = "button",
    disabled = false,
    block = false, // ancho completo
    className = "",
    style = {},
    color = "#9254de", // color por defecto
  icon = null,
}) {
    // Estilos inline por defecto (se pueden sobrescribir con `style` prop)
    const defaultInline = {
        padding: "4px 16px",
    };

    return (
        <button
            type={htmlType}
            disabled={disabled}
            onClick={onClick}
            className={`anf-btn ${block ? "anf-btn--block" : ""} ${className}`}
            style={{ ...defaultInline, ...style, ["--btn-color"]: color }}

        >
            {/* Icono (opcional) y texto envuelto en span. */}
            {icon ? <span className="anf-btn__icon">{icon}</span> : null}
            <span className="anf-btn__text">{children}</span>

            <style>{`
        .anf-btn{
          align-items: center;
          background-color: #fff;
          border-color: var(--btn-color);
          border-radius: 6px;
          border-style: solid;
          border-width: 1px;
          box-shadow: #9b05ff0f 0px 2px 0px 0px;
          color: var(--btn-color, #9254de);
          display: inline-flex;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          font-size: 14px;
          gap: 8px;
          justify-content: center;
          line-height: 22px;
          padding: 0px 16px;
          text-align: center;
          cursor: pointer;
          user-select: none;
          transition: background-color .18s ease, color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .02s ease;
          outline: none;
        }

        .anf-btn--block { width: 100%; }

        .anf-btn:hover:not(:disabled){
          background-color: rgba(146,84,222,0.06);
          border-color: var(--btn-color, #9254de);
          color: var(--btn-color, #9254de);
          box-shadow: 0 4px 12px rgba(146,84,222,0.12);
        }

        .anf-btn:active:not(:disabled){
          transform: translateY(0.5px);
          box-shadow: 0 2px 8px rgba(146,84,222,0.10);
        }

        .anf-btn:focus-visible{ 
          box-shadow: 0 0 0 3px rgba(146,84,222,0.12);
        }

        .anf-btn:disabled{
          cursor: not-allowed;
          opacity: .55;
          background-color: #fff;
          color: #c6b7e8;
          border-color: #f0edf8;
          box-shadow: none;
        }

        /* Estilos del span de texto interno */
        .anf-btn__text{
          color: var(--btn-color, #722ed1);
          font-size: 14px;
          line-height: 22px;
          text-align: center;
        }
        .anf-btn__icon{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--btn-color, #722ed1);
          /* tamaño del icono, si el icono es un SVG-inlined heredará el color */
          font-size: 16px;
          line-height: 1;
        }
      `}</style>
        </button>
    );
}
