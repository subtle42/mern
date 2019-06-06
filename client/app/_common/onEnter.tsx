import * as React from 'react'

interface Props {
    callback: Function
    children?: React.ReactNode
}

export const OnEnter: React.FunctionComponent<Props> = (props: Props) => {
    const newChildren = React.Children.map(props.children, child => {
        return React.cloneElement(child as any, {
            onKeyDown: event => {
                if (event.key === 'Enter') props.callback()
            }
        })
    })

    return <div>
        {newChildren}
    </div>
}
