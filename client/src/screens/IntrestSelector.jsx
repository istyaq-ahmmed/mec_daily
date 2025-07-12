///Slider.js
import {useState} from 'react'
import "../../src/index.css"
function Slider ({title, value, onChange}){
  return (
    <>
      <div className="slider">
        <div className="range-min-max-values">
          <span>{title}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          title={title}
          onChange={onChange}
        />
        <span>{value.toFixed(2)}%</span>
      </div>
    </>
  )
}



export function IntrestSelector() {
    const sliders = ['Slider 1', 'Slider 2', 'Slider 3']
    const [values, setValues] = useState(
    new Array(sliders.length).fill(100 / sliders.length),
  )

  function handleChange(index, value) {
    let maxValue = 100
    const remaining = maxValue - parseInt(value, 10)
    setValues((vs) =>
      vs.map((v, i) => {
        if (i === index) return parseInt(value, 10)
        const oldRemaining = maxValue - parseInt(vs[index], 10)
        if (oldRemaining) return (remaining * v) / oldRemaining
        return remaining / (sliders.length - 1)
      }),
    )
  }

  return sliders.map((item, index) => (
    <Slider
      key={index}
      index={index}
      value={values[index]}
      title={item}
      onChange={(e) => handleChange(index, e.target.value)}
    />
  ))
}