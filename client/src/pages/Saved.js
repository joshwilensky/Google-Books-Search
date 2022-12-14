import React, { Component } from 'react'
import Jumbotron from '../components/Jumbotron'
import Card from '../components/Card'
import Book from '../components/Book'
import Footer from '../components/Footer'
import API from '../utils/API'
import { Col, Row, Container } from '../components/Grid'
import { List } from '../components/List'

class Saved extends Component {
  state = {
    books: [],
  }

  componentDidMount() {
    this.getSavedBooks()
  }

  getSavedBooks = () => {
    API.getSavedBooks()
      .then((res) =>
        this.setState({
          books: res.data,
        }),
      )
      .catch((err) => console.log(err))
  }

  handleBookDelete = (id) => {
    API.deleteBook(id).then((res) => this.getSavedBooks())
  }

  render() {
    return (
      <Container>
        <Row>
          <Col size="md-12">
            <Jumbotron>
              <h1 className="text-center">
                <strong>Saved Books</strong>
              </h1>
            </Jumbotron>
          </Col>
        </Row>
        <Row>
          <Col size="md-12">
            <Card title="Saved Books" icon="download">
              {this.state.books.length ? (
                <List>
                  <h4 style={{ textAlign: 'center', margin: '10px' }}>
                    {this.state.books.length} saved books
                  </h4>
                  {this.state.books.map((book) => (
                    <Book
                      key={book._id}
                      title={book.title}
                      subtitle={book.subtitle}
                      link={book.link}
                      authors={book.authors.join(', ')}
                      description={book.description}
                      image={book.image}
                      Button={() => (
                        <button
                          onClick={() => this.handleBookDelete(book._id)}
                          className="btn btn-danger ml-2"
                        >
                          Delete
                        </button>
                      )}
                    />
                  ))}
                </List>
              ) : (
                <h2 className="text-center">No Saved Books</h2>
              )}
            </Card>
          </Col>
        </Row>
        <Footer />
      </Container>
    )
  }
}

export default Saved
