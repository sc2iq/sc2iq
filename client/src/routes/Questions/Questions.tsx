import React from 'react'
import * as RRD from 'react-router-dom'

const Outlet = (RRD as any).Outlet

type Props = {
}

const Users: React.FC<Props> = (props) => {
    return (
        <Outlet />
    )
}

export default Users