import { GlobalContext } from "./contexts/GlobalContext"
import Routes_ from "./routes/Routes"
import {ErrorBoundary} from './routes/errorBoundary'
const App = () => {
    return (
        <GlobalContext>
                <Routes_ />
        </GlobalContext>
    )
}

export default App
