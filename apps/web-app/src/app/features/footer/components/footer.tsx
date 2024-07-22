import { Link } from 'react-router-dom';

export const Footer = () => <div>
    <Link to="https://github.com/clbox-community/clbox/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 400 }}>
        clbox
    </Link>
    &nbsp;
    (
    <Link to="/changelog" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 300 }}>
        changelog
    </Link>
    &nbsp;
    /
    &nbsp;
    <Link to={'https://github.com/clbox-community/clbox/commit/' + process.env.NX_APP_VERSION} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 300 }}>
        {process.env.NX_APP_VERSION}
    </Link>
    )
</div>;
