import classNames from "classnames"; 

import { useRef } from "react";
import { InputCheckboxComponent } from "./types";

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)

  const handleChange = () => {
    onChange(!checked);
  };
  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
     <label htmlFor={inputId} className={classNames("RampInputCheckbox--label", {
  "RampInputCheckbox--label-checked": checked,
  "RampInputCheckbox--label-disabled": disabled,
})}>
  <div className="RampInputCheckbox--container" data-testid={inputId}>
    <input
      id={inputId}
      type="checkbox"
      className="RampInputCheckbox--input"
      checked={checked}
      disabled={disabled}
      onChange={handleChange}
    />
    <div className="RampInputCheckbox--checkmark"></div>
  </div>
</label>

    </div>
  )
}
