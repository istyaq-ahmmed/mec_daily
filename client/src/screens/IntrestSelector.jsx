///Slider.js
import {useState} from 'react'
import "../../src/index.css"
function Slider ({title, value, onChange}){
  return (
    <>
      <div className="slider range-neutral">
        <div className="range-min-max-values">
          <span>{title}</span>
        </div>
        <input
        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4 
          [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:bg-blue-500 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:border-4 
          [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:shadow-md
          [&::-moz-range-thumb]:w-4 
          [&::-moz-range-thumb]:h-4 
          [&::-moz-range-thumb]:bg-blue-500 
          [&::-moz-range-thumb]:rounded-full 
          [&::-moz-range-thumb]:border-4 
          [&::-moz-range-thumb]:border-white
          [&::-moz-range-thumb]:shadow-m'
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