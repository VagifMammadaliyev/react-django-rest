import React from 'react'
import ReactDOM from 'react-dom'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Pagination from 'react-bootstrap/Pagination'

import './index.css'

const axios = require('axios')
axios.defaults.withCredentials = true
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'


function getUrl(action, secure=false, port='8000', api='api/v0') {
  let schema = secure ? 'https://' : 'http://'
  return `${schema}localhost:${port}/${api}/${action}`
}


class Header extends React.Component {
  render() {
    let onClickMethod = this.props.isAuthenticated ?
      this.props.onLogout : this.props.onLoginModalShow

    return (
      <header>
        <Container fluid={true}>
          <Row>
            <Col className='title' md={3} xs={12}>
              <h1 className='p-5'>{this.props.appName}</h1>
            </Col>
            <Col className='login-control' md={9} xs={12}>
              <Button
                variant={this.props.isAuthenticated ? 'danger' : 'success'}
                onClick={onClickMethod}>
                {this.props.isAuthenticated ?
                  `Hi ${this.props.username}. Click to sign out.` :
                  'You are not signed in. Click to sign in.'}
              </Button>
            </Col>
          </Row>
        </Container>
      </header>
    )
  }
}


function WordTab(props){
  return (
    <div className='word-tab'>
      <div className='word-title'>
        <h2>{props.title}</h2>
        {props.isUserWord && <Button onClick={() => props.handleDeleteWord(props.wordId)} variant='danger'>Remove</Button>}
      </div>
      <div className='word-author'>
        <small>{props.author}</small>
      </div>
      <div className='word-mean mt-4 pr-4'>
        <p>{props.definition}</p>
      </div>
      <hr />
    </div>
  )
}


class Body extends React.Component {
  constructor(props) {
    super(props)
    this.handleMyWordsShow = this.handleMyWordsShow.bind(this)
    this.handleMyWordsClose = this.handleMyWordsClose.bind(this)
    this.handleDefinitionInput = this.handleDefinitionInput.bind(this)
    this.handleTitleInput = this.handleTitleInput.bind(this)
    this.clearAndHandleAddNewWord = this.clearAndHandleAddNewWord.bind(this)
    this.removeTabAndDeleteWord = this.removeTabAndDeleteWord.bind(this)

    this.state = {
      myWordsOpened: false,
      title: '',
      definition: '',
      invalidForm: false,
    }
  }

  handleTitleInput(event) {
    this.setState({
      title: event.target.value,
    })
  }

  handleDefinitionInput(event) {
    this.setState({
      definition: event.target.value,
    })
  }

  removeTabAndDeleteWord(wordId) {
    this.props.handleDeleteWord(wordId)
  }

  handleMyWordsShow() {
    this.setState({
      myWordsOpened: true,
    })
  }

  handleMyWordsClose() {
    this.setState({
      myWordsOpened: false,
    })
  }

  clearAndHandleAddNewWord() {
    const [title, definition] = [this.state.title, this.state.definition]

    if (!(title && definition)) {
      this.setState({
        invalidForm: true
      })
      return
    }

    this.setState({
      title: '',
      definition: '',
      invalidForm: false,
    })

    this.props.handleAddNewWord(title, definition)
  }

  render() {
    // All words
    const words = this.props.words
    let wordTabs
    if (words.length !== 0) {
      wordTabs = words.map(word => {
      return <WordTab key={word.id}
              title={word.title}
              author={word.author}
              definition={word.definition}
              isUserWord={false}
            />
      })
    }
    else {
      wordTabs = <h5>No words currently added.</h5>
    }

    // User words
    const userWords = this.props.myWords
    let userWordTabs
    if (userWords.length !== 0) {
      userWordTabs = userWords.map(word => {
        return <WordTab key={word.id}
                wordId={word.id}
                title={word.title}
                author={word.author}
                definition={word.definition}
                isUserWord={true}
                handleDeleteWord={this.removeTabAndDeleteWord}
              />
      })
    } else {
      userWordTabs = <h5>You have not added any word</h5>
    }

    let active = this.props.currentPage
    let pageItems = []
    for (let i = 1; i <= this.props.totalPages; i++) {
      pageItems.push(
        <Pagination.Item key={i}
          active={i === active} onClick={() => this.props.fetchWords(i)}>
          {i}
        </Pagination.Item>
      )
    }

    return (
      <Container className='body' fluid={true}>
        <Row>
          <Col className='mb-5' md={7} xs={12}>
            {wordTabs}
            <Pagination>{words.length !== 0 && pageItems}</Pagination>
          </Col>
          <Col md={5} xs={12}>
            <h3>Add a new word or <span onClick={this.props.isAuthenticated ? this.handleMyWordsShow : this.props.onLoginModalShow} className="my-word-control">see your words</span></h3>
            {this.state.invalidForm && <Alert variant='danger'>Please fill in each field</Alert>}
            {this.props.tooManyRequest && <Alert variant='warning'>You have added enough words for today. Let your powerfull mind rest.</Alert>}
            <Form className="mt-4 mb-4">
              <Form.Group controlId="formWordTitle">
                <Form.Label>Word itself</Form.Label>
                <Form.Control required value={this.state.title} onChange={this.handleTitleInput} autoComplete="text" type="text" placeholder="Your word..." />
              </Form.Group>
              <Form.Group controlId="formDefinition">
                <Form.Label>Definition</Form.Label>
                <Form.Control required value={this.state.definition} onChange={this.handleDefinitionInput} as='textarea' rows='5' autoComplete="text" type="text" placeholder="Definition..." />
              </Form.Group>
              <Button variant="success" type="button" onClick={this.props.isAuthenticated ? this.clearAndHandleAddNewWord : this.props.onLoginModalShow}>
                Add new word
              </Button>
            </Form>
          </Col>
        </Row>

        <Modal
            show={this.state.myWordsOpened}
            size='lg'
            aria-labelledby="contained-modal-title-vcenter"
            centered>
          <Modal.Header closeButton onClick={this.handleMyWordsClose}>
            <Modal.Title id="contained-modal-title-vcenter">
              Your words
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {userWordTabs}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleMyWordsClose} variant='secondary'>Close</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    )
  }
}


class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleLoginClose = this.handleLoginClose.bind(this)
    this.handleLoginShow = this.handleLoginShow.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleRegister = this.handleRegister.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleUsernameInput = this.handleUsernameInput.bind(this)
    this.handlePasswordInput = this.handlePasswordInput.bind(this)
    this.handlePassword2Input = this.handlePassword2Input.bind(this)
    this.handleAddNewWord = this.handleAddNewWord.bind(this)
    this.handleDeleteWord = this.handleDeleteWord.bind(this)
    this.fetchWords = this.fetchWords.bind(this)
    this.handleRegisterModalShow = this.handleRegisterModalShow.bind(this)

    this.state = {
      registerModalOpened: false,
      loginModalOpened: false,
      username: '',
      usernameValue: '',
      passwordValue: '',
      password2Value: '',
      badLogin: false,
      isAuthenticated: false,
      myWords: [],
      words: [],
      currentPage: 1,
      totalPages: 0,
      tooManyRequest: false,
      regErrors: null,
    }

    this.fetchAuthContext()

    this.fetchWords(this.state.currentPage)
  }

  handleDeleteWord(wordId) {
    axios.delete(getUrl(`word/${wordId}`)).then(response => {
      this.fetchWords(this.state.currentPage)
      this.fetchUserWords()
    })
  }

  fetchWords(page=1) {
    axios.get(getUrl(`words/?page=${page}`))
      .then(response => {
        if (response.status === 200) {
          this.setState({
            words: response.data.results,
            currentPage: page,
            totalPages: response.data.total
          })
        }
      })
  }

  fetchUserWords() {
    if (this.state.isAuthenticated) {
      axios.get(getUrl('my-words'))
        .then(response => {
          if (response.status === 200) {
            this.setState({
              myWords: response.data,
            })
          }
        })
    }
  }

  handleAddNewWord(title, definition) {
    axios.post(getUrl('words/'), {
      title: title,
      definition: definition
    })
      .then(response => {
        if (response.status === 201) {
          this.fetchWords(this.state.currentPage)
          this.fetchUserWords()
        }
      })
      .catch(error => {
        if (error.response.status === 429) {
          this.setState({
            tooManyRequest: true,
          })
        }
      })
  }

  handleRegisterModalShow() {
    this.setState({
      registerModalOpened: true,
      loginModalOpened: true,
    })
  }

  handleLoginClose() {
    this.setState({
      loginModalOpened: false,
      registerModalOpened: false,
      regErrors: null,
    })
  }

  handleLoginShow() {
    this.setState({
      loginModalOpened: true,
    })
  }

  fetchAuthContext() {
    axios.get(getUrl('check-session-auth'))
      .then(response => {
        if (response.status === 200) {
          let username = ''
          if (response.data.username !== null) {
            username = response.data.username
          }

          this.setState({
            username: username,
            isAuthenticated: response.data.is_authenticated,
          })

          this.fetchUserWords()
        } else {
          this.setState({
            isAuthenticated: false,
          })
        }
      })
  }

  handleLogin() {
    axios.get(getUrl('check-session-auth'))
      .then(response => {
        if (response.status === 200) {

          return axios.post(getUrl('signin/'), {
              username: this.state.usernameValue,
              password: this.state.passwordValue,
            })
              .then(response => {
                if (response.status === 200) {
                  if (response.data.username) {
                    this.setState({
                      isAuthenticated: true,
                      username: response.data.username,
                    })
                    this.setState({
                      badLogin: false,
                    })
                    this.fetchUserWords()
                    this.handleLoginClose()
                  } else {
                    // Invalid creditentals
                    this.setState({
                      badLogin: true,
                    })
                  }
                } else {
                  this.handleLoginClose()
                }
              })
        }
      })
  }

  handleRegister() {
    axios.post(getUrl('signup/'), {
      username: this.state.usernameValue,
      password1: this.state.passwordValue,
      password2: this.state.password2Value,
    })
      .then(response => {
        console.log(response);
        if (response.status === 201) {
          this.handleLogin()
        } else if (response.status === 200) {
          this.setState({
            regErrors: response.data
          })
        }
      })
  }

  handleLogout() {
    axios.get(getUrl('signout/'))
      .then(response => {
        if (response.status === 200) {
          this.setState({
            isAuthenticated: false,
            username: '',
            myWords: [],
            tooManyRequest: false,
          })
        }
      })
  }

  handleUsernameInput(event) {
    this.setState({
      usernameValue: event.target.value,
    })
  }

  handlePasswordInput(event) {
    this.setState({
      passwordValue: event.target.value,
    })
  }

  handlePassword2Input(event) {
    this.setState({
      password2Value: event.target.value,
    })
  }

  render() {
    const alertElement = this.state.badLogin &&
      <Alert variant='danger'>Invalid username or password were provided</Alert>

    const registerInput = this.state.registerModalOpened &&
      <Form.Group controlId="formPassword2">
        <Form.Label>Confirm password</Form.Label>
        <Form.Control required autoComplete="password" onChange={this.handlePassword2Input} type="password" placeholder="Password confirmation..." />
      </Form.Group>

    const regErrors = this.state.regErrors
    let registrationError = null
    if (regErrors) {
      registrationError = <Alert variant='danger'><ul>{regErrors.errors.map((error, i) => {
        return <li key={i}>{error}</li>;
      })}</ul></Alert>
    }

    return (
      <div className="app">
        <Header appName="WordMean"
                onLoginModalHide={this.handleLoginClose}
                onLoginModalShow={this.handleLoginShow}
                onLogout={this.handleLogout}
                username={this.state.username}
                isAuthenticated={this.state.isAuthenticated}/>
        <hr />

        <Body
          words={this.state.words}
          myWords={this.state.myWords}
          isAuthenticated={this.state.isAuthenticated}
          onLoginModalShow={this.handleLoginShow}
          handleAddNewWord={this.handleAddNewWord}
          handleDeleteWord={this.handleDeleteWord}
          totalPages={this.state.totalPages}
          currentPage={this.state.currentPage}
          fetchWords={this.fetchWords}
          tooManyRequest={this.state.tooManyRequest}
        />


        <Modal show={this.state.loginModalOpened}>
          <Modal.Header>
            <Modal.Title>Sign In or <span onClick={this.handleRegisterModalShow}className="my-word-control">register</span></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {alertElement}
            {registrationError}
            <Form>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control required autoComplete="username" onChange={this.handleUsernameInput} type="text" placeholder="Username..." />
              </Form.Group>
              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control required autoComplete="password" onChange={this.handlePasswordInput} type="password" placeholder="Password..." />
              </Form.Group>
              {registerInput}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleLoginClose}>
              Close
            </Button>
            <Button variant="success" onClick={this.state.registerModalOpened ? this.handleRegister : this.handleLogin}>
              {this.state.registerModalOpened ? 'Register' : 'Sign In'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
)
