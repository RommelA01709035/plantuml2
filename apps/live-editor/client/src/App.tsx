import './App.css'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/Home/HomePage'
import { EditorPage } from './pages/Editor/EditorPage'

function App() {
  return (
    <Routes>

      <Route path="/" element={<HomePage />} />
      <Route path="/editor" element={<EditorPage />} />

    </Routes>
  );
}

export default App
