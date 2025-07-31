"use client";

import { DayPicker } from "react-day-picker";

export default function Calendar() {
  return (
    <>
      <DayPicker
        className="react-day-picker"
        mode="single"
        selected={undefined}
        onDayClick={() => {}}
        // modifiers={modifiers}
        // modifiersClassNames={modifiersClassNames}
        // disabled={(date) => isReserved(date)}
        components={{
          DayButton: (props) => {
            if (props.disabled) {
              return (
                <div className="tooltip tooltip-secondary" data-tip="Réservé">
                  <button {...props}></button>
                </div>
              );
            } else {
              return <button {...props}></button>;
            }
          },
        }}
      />
    </>
  );
}
