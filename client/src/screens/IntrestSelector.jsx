///Slider.js
import {useState} from 'react'
import "../../src/index.css"
function Slider ({title, value, onChange}){
  return (
    <>
      <div className=" w-full mx-center p-2  rounded-lg border-4 border-sky-300 m-4 bg-gray-300 hover:bg-blend-darker">
        <div className="range-min-max-values ">
          <span className=' text-xl text-bold text-red'>{title}</span>
        </div>
        <input
        className='w-full h-2 bg-gray-300 rounded-full  cursor-pointer


        '
          type="range"
          min={0}
          max={100}
          value={value}
          title={title}
          onChange={onChange}
        />
        <span className=' text-xl text-bold '>{value.toFixed(2)}%</span>
      </div>
    </>
  )
}



export function IntrestSelector() {
    const sliders = ['Sports', 'Politics', 'Entertainment','International']
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