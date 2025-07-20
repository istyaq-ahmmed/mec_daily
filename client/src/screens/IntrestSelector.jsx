///Slider.js
import {useState,useEffect} from 'react'
import "../../src/index.css"
function Slider ({title, value, onChange}){
  return (

    <div className='flex items-center justify-center pt-4'>
        <span className='w-2/4 md:w-1/5 text-right text-xl text-bold text-gray'>{title} :</span>
        <input
        className='w-full h-2 accent-dark-grey rounded-full cursor-pointer'
          type="range"
          min={0}
          max={100}
          value={value}
          title={title}
          onChange={onChange}
        />

    </div>

  )
}



export function IntrestSelector() {

    const sliders = ['Sports', 'Politics', 'Entertainment','International','Technology']

    const [values, setValues] = useState(()=>{
      console.log('xxxxxx')
      const saved = localStorage.getItem("interest_weights");
      return saved ? JSON.parse(saved) : new Array(sliders.length).fill(100 / sliders.length);
    }


  )
  useEffect(()=>{
    localStorage.setItem('interest_weights',JSON.stringify(values))
  },[values])

  function handleChange(index, value) {
    let maxValue = 100
    const remaining = maxValue - parseInt(value, 10)
    console.log('HHH')
    setValues((vs) =>
        vs.map((v, i) => {
          if (i === index) return parseInt(value, 10)
          const oldRemaining = maxValue - parseInt(vs[index], 10)
          if (oldRemaining) return (remaining * v) / oldRemaining
          return remaining / (sliders.length - 1)
        }
      )
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