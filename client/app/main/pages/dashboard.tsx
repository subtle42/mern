import * as React from 'react'
import { Row, Col, Form, Card, CardHeader, CardBody, ListGroup, ListGroupItem} from 'reactstrap'
import { connect } from 'react-redux'
import { IOffer } from 'common/models'
import { StoreModel } from 'data/store'


interface Props {
    myTasks: IOffer[],
    myOffers: IOffer[]
}

const DashboardComp: React.StatelessComponent<Props> = (props: Props) => {

  const openEdit = () => {}

  const openDetails = () => {}

  return <Form>
      <Row>
          <Col md={6}>
              <Card>
                  <CardHeader>My Tasks</CardHeader>
                  <CardBody>
                      <ListGroup>
                          {props.myTasks.map((task, index) => {
                              return <ListGroupItem action key={index}>
                                  {task.offerType} - {task.propertyAddress.city}
                              </ListGroupItem>
                          })}
                      </ListGroup>
                  </CardBody>
              </Card>
          </Col>
          <Col md={6}>
            <Card>
                <CardHeader>My Offers</CardHeader>
                <CardBody>
                    <ListGroup>
                        {props.myOffers.map((task, index) => {
                            return <ListGroupItem action key={index}>
                                {task.offerType} - {task.propertyAddress.city}
                            </ListGroupItem>
                        })}
                    </ListGroup>
                </CardBody>
            </Card>
          </Col>
      </Row>
  </Form>
}


export const DashboardPage = connect((store: StoreModel): Props => {
    return {
        myTasks: store.offer.list.filter(offer => offer.assignedTo === store.auth.me._id),
        myOffers: store.offer.list.filter(offer => offer.createdBy === store.auth.me._id)
    }
})(DashboardComp)
