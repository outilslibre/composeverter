// import React, { useEffect, useRef } from 'react';
import React from 'react';

// const ADS_URL = '//cdn.carbonads.com/carbon.js?serve=CE7IK5QU&placement=wwwcomposevertercom'; //TODO: reconfigure
// const CARBON_SCRIPT_ID = '_carbonads_js';

const CarbonAds = React.memo(() => (
    // Where we'll render the ad into
    // @see https://reactjs.org/docs/hooks-reference.html#useref
    /* const adsElement = useRef(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = ADS_URL;
        script.async = true;
        script.id = CARBON_SCRIPT_ID;
        adsElement.current.appendChild(script);
    }); */

    // return <div ref={adsElement} />;
    <div />
));

export default CarbonAds;
