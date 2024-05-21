import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [color, setColor] = useState('gray');
  const [times, setTimes] = useState([]);
  const [trial, setTrial] = useState(0);
  const [totalTrials, setTotalTrials] = useState(5);
  const [startTime, setStartTime] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [highScores, setHighScores] = useState([]);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let countdownInterval;
    if (isRunning && trial < totalTrials) {
      const randomTime = Math.random() * 2000 + 1000;
      setCountdown(Math.floor(randomTime / 1000));

      countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        setColor('green');
        setStartTime(Date.now());
        clearInterval(countdownInterval);
      }, randomTime);

      return () => {
        clearTimeout(timeout);
        clearInterval(countdownInterval);
      };
    }
  }, [isRunning, trial, totalTrials]);

  const handleStart = () => {
    setIsRunning(true);
    setTimes([]);
    setTrial(0);
    setColor('gray');
    setHighScores([]);
    setClicks(0);
  };

  const handleStop = () => {
    setIsRunning(false);
    setColor('gray');
    clearTimeout(timerRef.current);
  };

  const handleClick = () => {
    if (isRunning && color === 'green') {
      const reactionTime = Date.now() - startTime;
      setTimes([...times, reactionTime]);
      setColor('gray');
      setTrial(trial + 1);
    } else if (isRunning && color === 'gray') {
      setClicks(clicks + 1);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (keyboardMode && e.key === ' ') {
        handleClick();
      }
    };

    if (keyboardMode) {
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [keyboardMode, color]);

  const getStats = () => {
    if (times.length === 0) return null;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    if (!bestTime || min < bestTime) {
      setBestTime(min);
    }
    return { min, max, avg };
  };

  const handleSaveScore = () => {
    const stats = getStats();
    if (stats) {
      setHighScores([...highScores, stats]);
    }
  };

  const stats = getStats();

  return (
      <div className="App container text-center mt-5">
        <h1>Reaction Game</h1>
        <div className="form-group">
          <label htmlFor="trials">Number of Trials:</label>
          <input
              type="number"
              id="trials"
              className="form-control"
              value={totalTrials}
              onChange={(e) => setTotalTrials(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="form-check">
          <input
              type="checkbox"
              className="form-check-input"
              id="keyboardMode"
              checked={keyboardMode}
              onChange={() => setKeyboardMode(!keyboardMode)}
          />
          <label className="form-check-label" htmlFor="keyboardMode">Keyboard Mode</label>
        </div>
        <div
            className="click-area d-flex justify-content-center align-items-center mx-auto my-4 position-relative"
            style={{ backgroundColor: color }}
            onClick={handleClick}
        >
          {isRunning && color === 'gray' && <span>{countdown}</span>}
        </div>
        <div className="controls my-4">
          {!isRunning ? (
              <button className="btn btn-primary" onClick={handleStart}>Start</button>
          ) : (
              <button className="btn btn-danger" onClick={handleStop}>Stop</button>
          )}
        </div>
        {stats && (
            <div className="stats my-4">
              <p>Shortest Time: {stats.min} ms</p>
              <p>Longest Time: {stats.max} ms</p>
              <p>Average Time: {stats.avg.toFixed(2)} ms</p>
              <button className="btn btn-success" onClick={handleSaveScore}>Save Score</button>
            </div>
        )}
        {highScores.length > 0 && (
            <div className="high-scores my-4">
              <h2>High Scores</h2>
              <ul className="list-group">
                {highScores.map((score, index) => (
                    <li key={index} className="list-group-item">
                      <p>Shortest: {score.min} ms</p>
                      <p>Longest: {score.max} ms</p>
                      <p>Average: {score.avg.toFixed(2)} ms</p>
                    </li>
                ))}
              </ul>
            </div>
        )}
        <div className="my-4">
          <h2>Best Time: {bestTime ? `${bestTime} ms` : 'N/A'}</h2>
          <h3>Clicks before change: {clicks}</h3>
        </div>
      </div>
  );
}

export default App;
