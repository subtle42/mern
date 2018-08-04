import * as React from 'react'
import { Modal } from 'reactstrap'
import widgetActions from 'data/widgets/actions'
import { ISource } from 'common/models'
import { EditSourceContent } from './edit'
import { SelectSourceContent } from './select'
import { SelectWidget } from '../widget/select'
import * as FontAwesome from 'react-fontawesome'
import './style.css'

class State {
    showModal: boolean = false
    confirmedSource: ISource = undefined
    showSourceSelect: boolean = true
    editSource: ISource = undefined
}

interface Props { }

export class SourceCreateButton extends React.Component<Props, State> {
    state: State = new State()

    close = (chartType: string) => {
        widgetActions.create({
            source: this.state.confirmedSource,
            type: chartType
        })
        .then(widgetId => {
            let resetState = new State()
            this.setState(resetState)
        })
    }

    open = () => {
        this.setState({
            showModal: true
        })
    }

    cancel = (event?) => {
        if (event) event.stopPropagation()
        let resetState = new State()
        this.setState(resetState)
    }

    editSource = (source: ISource): void => {
        this.setState({
            editSource: source
        })
    }

    setSource = (source: ISource) => {
        this.setState({
            confirmedSource: source
        })
    }

    getModalContents (): JSX.Element {
        if (this.state.editSource) {
            return <EditSourceContent
            _id={this.state.editSource._id}
            done={() => this.editSource(undefined)} />
        }

        if (this.state.confirmedSource) {
            return <SelectWidget back={() => this.setSource(undefined)}
            cancel={() => this.cancel()}
            done={(chartType: string) => this.close(chartType)} />
        }

        if (!this.state.confirmedSource) {
            return <SelectSourceContent done={(source) => this.setSource(source)}
            editSource={(source) => this.editSource(source)}
            cancel={() => this.cancel()} />
        }

        return <div/>
    }

    render () {
        return (<div className='fixed-plugin-left' onClick={this.open}>
            <div>
                <FontAwesome style={{ paddingTop: 6 }} size='2x' name='plus' />
                <Modal size='lg' isOpen={this.state.showModal}>
                    {this.getModalContents()}
                </Modal>
            </div>
        </div>)
    }
}
