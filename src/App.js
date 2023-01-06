import './styles.css'
import useLocalStorage from './hooks/useLocalStorage'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
const { Configuration, OpenAIApi } = require('openai')

const configureOpenai = apiKey => new OpenAIApi(new Configuration({ apiKey }))

const Router = props => {
  switch (props.route) {
    case 'improve':
      return (
        <div style={{ width: '100%' }}>
          {/* <h3>Instructions for improvements</h3>
          <textarea
            placeholder="instructions"
            style={{
              width: '100%',
              maxWidth: '100%',
              minWidth: '100%',
              height: '15vh',
              fontFamily: 'Open Sans, sans-serif',
              fontWeight: 400,
              padding: 5,
              // color: '#000',
            }}
            value="You are a brillant professional copywriter. Rewrite the above text fixing typos and applying improvements"
          /> */}
          <button
            onClick={async e => {
							if (props.input === "") { return }
							toast('Requesting OpenAi...', {
								icon: '🔄',
							});
							props.setResult("")

              const instructions =
                'You are a brillant professional copywriter. Fix typos and applying improvements. Reply only with the result.'
              props.setIsRequesting(true)
              const openai = configureOpenai(props.apiKey)
              const rawResponse = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: props.input + '\n\n######## ' + instructions + '\n\n',
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
              })
              console.log(rawResponse.data.choices[0].text.trim())
              props.setResult(rawResponse.data.choices[0].text.trim())
              props.setIsRequesting(false)
							toast('OpenAI returned a result!', {
								icon: '💡',
							});
            }}
            style={{
              marginTop: 5,
            }}
            disabled={props.isRequesting}
          >
            Improve
          </button>
          <h3>Result</h3>
          <textarea
            style={{
              // backgroundColor: 'red',
              width: '100%',
              maxWidth: '100%',
              minWidth: '100%',
              textAlign: 'left',
              minHeight: '15vh',
              padding: 5,
              fontFamily: 'Open Sans, sans-serif',

              // border: 'solid 1px black',
              // borderRadius: 2,
              // border: 'solid 1px rgb(100, 100, 100)',
            }}
            placeholder="results"
            value={props.result}
          ></textarea>
          <button
            onClick={async e => {
              navigator.clipboard.writeText(props.result)
							toast('Result copied to clipboard!', {
								icon: '📋',
							});
            }}
            style={{
              marginTop: 0,
              marginRight: 5,
            }}
          >
            Copy Result
          </button>
          <button
            onClick={async e => {
              props.setResult("")
            }}
            style={{
              marginTop: 0,
            }}
            className="inverse"
          >
            Clear Result
          </button>
        </div>
      )
    case 'review':
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <h3>Reviewers</h3>
              <span>
                <input
                  defaultChecked="true"
                  type="checkbox"
                  id="grammar_guru"
                  name="grammar_guru"
                />
                <label for="grammar_guru">🧐 Grammar Guru</label>
              </span>
              <i
                style={{
                  fontSize: 12,
                }}
              >
                Grammar & Typos
              </i>
              <br />
              <span>
                <input
                  defaultChecked="true"
                  type="checkbox"
                  id="balanced_ben"
                  name="balanced_ben"
                />
                <label for="balanced_ben">😐 Balanced Ben</label>
              </span>
              <i
                style={{
                  fontSize: 12,
                }}
              >
                Stengths & Weankesses
              </i>
              <br />
              <span>
                <input
                  defaultChecked="true"
                  type="checkbox"
                  id="technical_tron"
                  name="technical_tron"
                />
                <label for="technical_tron">🤖 Technical Tron</label>
              </span>
              <i
                style={{
                  fontSize: 12,
                }}
              >
                Facts & Technicals
              </i>
              <br />
            </div>
            <button>Review</button>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <h3>Result</h3>
            <textarea
              style={{
                // backgroundColor: 'red',
                width: '100%',
                maxWidth: '100%',
                minWidth: '100%',
                textAlign: 'left',
                minHeight: '10vh',
                // opacity: 0,
                padding: 5,
                // border: 'solid 1px black',
                // borderRadius: 2,
                // border: 'solid 1px rgb(100, 100, 100)',
              }}
              placeholder="results"
            ></textarea>
          </div>
        </div>
      )
    case 'diagram':
      return <div>diagram</div>
    case 'document':
      return <div>document</div>
    case 'mdtable':
      return <div>mdtable</div>
    case 'summarizer':
      return <div>summarizer</div>
    case 'reviewpr':
      return <div>review pr</div>
    case 'words':
      return <div>alternative words</div>
    default:
      return <div>Route Error: {props.route}</div>
  }
}

const RouteLink = props => (
  <a
    onClick={() => {
      !props.disabled && props.setRoute(props.tag)
    }}
    style={{
      color: props.route === props.tag ? 'black' : '#eee',
      borderTop:
        props.route === props.tag ? 'solid 1px black' : 'solid 1px transparent',
      // borderBottom:
      //   props.route === props.tag ? 'solid 1px black' : 'solid 1px transparent',
      // borderRadius: 1,
      cursor: !props.disabled ? 'pointer' : 'default',
      // width: 50,
      wordSpacing: '100%',
      flexBasis: 0,
    }}
		href="#"
  >
    {/* {props.route === props.tag && '> '} */}
    {props.text}
  </a>
)

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('key', null)
  const [apiKeyTemp, setApiKeyTemp] = useState(null)
  const [route, setRoute] = useLocalStorage('route', 'improve')
  const [input, setInput] = useLocalStorage('input', '')
  const [result, setResult] = useLocalStorage('result', '')
  const [isRequesting, setIsRequesting] = useState(false)

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Toaster
        position="bottom-center"
        // reverseOrder={false}
      />
      <p
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '5px 20px',
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
        {apiKey && (
          <button
            className="inverse"
            onClick={() => setApiKey(null)}
            style={{
              padding: '5px 10px',
              borderRadius: 3,
            }}
          >
            X
          </button>
        )}
      </p>
      <h1
        style={{
          fontFamily: 'Oswald, sans-serif',
          fontSize: 52,
          color: 'black',
          margin: '20px 0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 0,
          marginTop: 30,
        }}
      >
        <span
          style={{
            fontWeight: 300,
          }}
        >
          Docu
        </span>
        <span
          style={{
            fontWeight: 500,
          }}
        >
          Droid
        </span>
        <img style={{ marginLeft: 5 }} src="./logo.png" width="80px" alt="logo" />
      </h1>
      {/* <p>version: 5 </p> */}
      {apiKey ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 960,
            width: '95%',
          }}
        >
          <div
            style={{
              // width: '95%',
              display: 'flex',
              flexDirection: 'row',
              marginTop: 21,
              fontFamily: 'Open Sans, sans-serif',
              fontWeight: 400,
              justifyContent: 'space-between',
              // position: 'absolute',
              // left: '20px',
              // top: 0,
              fontSize: 14,
              textDecoration: 'none',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <RouteLink
              route={route}
              setRoute={setRoute}
              tag="improve"
              text="improve text"
            />
            <RouteLink
              disabled
              route={route}
              setRoute={setRoute}
              tag="review"
              text="review text"
            />
            <RouteLink
              disabled
              route={route}
              setRoute={setRoute}
              tag="reviewpr"
              text="review diff"
            />
            <RouteLink
              disabled
              route={route}
              setRoute={setRoute}
              tag="diagram"
              text="diagram gen"
            />
            <RouteLink
              disabled
              route={route}
              setRoute={setRoute}
              tag="document"
              text="docs gen"
            />
            <RouteLink
              disabled
              route={route}
              setRoute={setRoute}
              tag="mdtable"
              text="md gen"
            />
            <RouteLink
              disabled
              route={route}
              setRoute={setRoute}
              tag="summarizer"
              text="reduce text"
            />
            <RouteLink
              disabled
              route={route}
              setRoute={setRoute}
              tag="words"
              text="alt words"
            />
          </div>

          <span
            style={{
              width: '100%',
              marginTop: 25,
            }}
          >
            {/* <h3
              style={{
                textAlign: 'right',
              }}
            >
              Input
            </h3> */}
          </span>
          <textarea
            placeholder="input text goes here"
            style={{
              width: '100%',
              maxWidth: '100%',
              minWidth: '100%',
              height: '15vh',
              fontFamily: 'Open Sans, sans-serif',
              fontWeight: 400,
              padding: 5,
              // color: '#000',
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div
            style={{
              marginTop: 0,
              fontFamily: 'Open Sans, sans-serif',
              fontWeight: 400,
              width: '100%',
            }}
          >
            <Router
              route={route}
              result={result}
              input={input}
              setResult={setResult}
              apiKey={apiKey}
              isRequesting={isRequesting}
              setIsRequesting={setIsRequesting}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <br />
          <label style={{ marginBottom: 2 }} for="key">
            Insert GPT3 Key
            <br />
            <i style={{ fontSize: 12 }}>
              (saved in browser localstorage, logout to clean)
            </i>
          </label>
          <input
            style={{
              width: 400,
              textAlign: 'center',
              padding: 7,
            }}
            id="key"
            type="text"
            onChange={e => setApiKeyTemp(e.target.value)}
          />
          <br />
          <button onClick={() => setApiKey(apiKeyTemp)}>Start!</button>
        </div>
      )}
    </div>
  )
}
