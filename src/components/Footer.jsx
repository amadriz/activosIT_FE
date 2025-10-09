import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

export const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 border-top">
      <Container>
        <Row>
          <Col md={12} className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Todos los derechos reservados
            </p>            
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
