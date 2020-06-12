import React, { useCallback, useEffect, useState } from 'react'
import copyToClipboard from 'clipboard-copy'
import './App.css'

const fetchFormats = () =>
  fetch('/api/formats').then(response => response.json())

const detectFormat = file => {
  const params = new URLSearchParams()
  params.set('mimetype', file.type)
  params.set('filename', file.name)

  return fetch('/api/format?' + params.toString()).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    return response.json()
  })
}

const readFile = file =>
  fetch(URL.createObjectURL(file)).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    return response.text()
  })

const convert = ({ toFormat, fromFormat, input }) =>
  fetch('/api/convert', {
    method: 'POST',
    mode: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ toFormat, fromFormat, input: input.trim() }),
  }).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    return response.text()
  })

const chooseExtension = (formats, format) => {
  for (const [extension, types] of Object.entries(formats.extension)) {
    if (types.includes(format)) {
      return extension
    }
  }

  return '.txt'
}

export const App = () => {
  const [filename, setFilename] = useState(undefined)
  const [input, setInput] = useState(undefined)
  const [output, setOutput] = useState(undefined)
  const [formats, setFormats] = useState(undefined)
  const [fromFormat, setFromFormat] = useState(undefined)
  const [toFormat, setToFormat] = useState(undefined)
  const [error, setError] = useState(undefined)

  useEffect(() => {
    fetchFormats()
      .then(formats => setFormats(formats))
      .catch(error => setError(`Unable to fetch formats: ${error.message}`))
  }, [])

  const handleInputChange = useCallback(event => {
    event.preventDefault()

    setInput(undefined)
    setFilename(undefined)
    setOutput(undefined)
    setFromFormat(undefined)
    setError(undefined)

    if (event.target.files) {
      const [file] = event.target.files

      if (file) {
        if (file.size < 1024 * 1024) {
          setFilename(file.name)

          detectFormat(file).then(({ format }) => {
            setFromFormat(Array.isArray(format) ? format[0] : format)
          })

          readFile(file).then(input => setInput(input))
        } else {
          alert('Please choose a file smaller than 1MB')
        }
      }
    }
  }, [])

  const handleSubmit = useCallback(
    event => {
      event.preventDefault()

      setError(undefined)

      convert({ input, fromFormat, toFormat })
        .then(output => {
          setOutput(output)
        })
        .catch(error =>
          setError(`There was an error during conversion: ${error.message}`)
        )
    },
    [toFormat, fromFormat, input]
  )

  const handleDownload = useCallback(
    event => {
      event.preventDefault()

      const extension = chooseExtension(formats, toFormat)

      const link = document.createElement('a')
      link.download = (filename || 'Untitled.txt').replace(/\.\w+$/, extension)
      link.href = URL.createObjectURL(new Blob([output]))
      link.click()
    },
    [filename, output, toFormat, formats]
  )

  const handleCopy = useCallback(
    event => {
      event.preventDefault()

      copyToClipboard(output)
    },
    [output]
  )

  return (
    <form onSubmit={handleSubmit}>
      <p>bibu: convert between bibliographic metadata formats</p>
      
      <div>
        <input type="file" onChange={handleInputChange} />
      </div>

      <textarea
        value={input}
        onChange={event => setInput(event.target.value)}
        className="code"
      />

      {input && formats && (
        <div>
          Convert from
          <select
            value={fromFormat}
            onChange={event => setFromFormat(event.target.value)}
          >
            <option key={undefined} value={undefined}>
              Select the input format…
            </option>

            {Object.entries(formats.human.from).map(([name, format]) => (
              <option key={format} value={format}>
                {name}
              </option>
            ))}
          </select>
          to
          <select
            value={toFormat}
            onChange={event => setToFormat(event.target.value)}
          >
            <option key={undefined} value={undefined}>
              Select an output format…
            </option>

            {Object.entries(formats.human.to).map(([name, format]) => (
              <option key={format} value={format}>
                {name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={!(fromFormat && toFormat)}>
            Convert
          </button>
          <button onClick={handleDownload} disabled={!output}>
            Download
          </button>
          <button onClick={handleCopy} disabled={!output}>
            Copy to clipboard
          </button>
        </div>
      )}

      {error && <div>{error}</div>}

      {output && <output className="code">{output}</output>}
    </form>
  )
}
