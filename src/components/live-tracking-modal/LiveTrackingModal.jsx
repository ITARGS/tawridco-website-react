import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import "./livetrackingModal.css"
import { useTranslation } from 'react-i18next';
import { BiChevronRight, BiGift, BiPhoneCall, BiStoreAlt } from 'react-icons/bi';
import { IoLocationOutline } from "react-icons/io5";
import {
    GoogleMap, Marker, useJsApiLoader, Polyline, OverlayView
} from '@react-google-maps/api';
import * as newApi from '../../api/apiCollection';


const LiveTrackingModal = ({ showLiveLocationModal, setShowLiveLocationModal, selectedOrder }) => {

    const { t } = useTranslation();
    const [map, setMap] = useState(null);
    const [riderLocation, setRiderLocation] = useState({ lat: 23.2404495, lng: 69.7110914 });
    const [userLocation, setUserLocation] = useState({
        lat: null,
        lng: null,
    });



    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const res = await newApi.liveOrderTracking({ orderId: selectedOrder?.id })
                console.log("delivery boy locatoin", res)
            } catch (error) {
                console.log("error", error)
            }
        }
        if (selectedOrder?.latitude && selectedOrder?.longitude) {

            setUserLocation({
                lat: parseFloat(selectedOrder?.latitude),
                lng: parseFloat(selectedOrder?.longitude)
            });
        }
        fetchLocation()
    }, [selectedOrder]);

    const handleClose = () => setShowLiveLocationModal(false);
    const containerStyle = {
        width: '558px',
        height: '410px'
    };
    const center = {
        lat: 23.2404495,
        lng: 69.7110914
    };
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_MAP_API
    })

    const GOOGLE_MAPS_LIBRARIES = ["places", "geometry"];

    const onLoad = React.useCallback(function callback(map) {
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        setMap(map)
    }, [])

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

    const polylineOptions = {
        strokeColor: "#FF0000",
        strokeOpacity: 0.5,
        strokeWeight: 5,
        icons: [
            {
                icon: {
                    path: "M 0,-1 0,1",
                    strokeOpacity: 1,
                    scale: 4,
                },
                offset: "0",
                repeat: "20px",
            },
        ],
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12) || 12;

        // Combine all parts into the desired format
        return `${day}, ${month}, ${year}, ${formattedHours}:${minutes} ${ampm}`;
    }

    return (
        <>
            <Modal show={showLiveLocationModal} onHide={handleClose} size='xl' centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("livetracking")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='d-flex live-location-container'>
                        <div className='col-6 location'>

                            {isLoaded ? <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={center}
                                zoom={7}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                            >
                                <Marker position={riderLocation}></Marker>
                                <Marker position={userLocation}></Marker>
                                <></>
                                {riderLocation && userLocation && (
                                    <Polyline path={[riderLocation, userLocation]} options={polylineOptions} />
                                )}
                            </GoogleMap> : null}
                        </div>
                        <div className='col-6 order-detail'>

                            <div className='d-flex justify-content-between order-detail-header'>
                                <h1>Order Detail</h1>
                                <h3 className='d-flex align-items-center'>Order #{selectedOrder?.id} <BiChevronRight /></h3>
                            </div>
                            <div className='order-status d-flex align-items-center '>
                                <div className='gift-pack-svg'>
                                    <BiGift size={30} />
                                </div>
                                <div className=''>
                                    <h3>Order Placed Successfully</h3>
                                    <p>{formatDate(selectedOrder?.date)}</p>
                                </div>

                            </div>
                            <div className='delivery-status d-flex flex-column'>
                                <p className='delivery-header'>Deliery Detail</p>
                                <div className='delivery-detail d-flex'>
                                    <div className='sender col-6 d-flex gap-3 align-items-center'>
                                        <div className='delivery-svg'>
                                            <BiStoreAlt size={24} />
                                        </div>
                                        <div>
                                            <p>Delivery from</p>
                                            <h3>Stark's store</h3>
                                        </div>
                                    </div>
                                    <div className='receiver col-6 d-flex gap-3 align-items-center'>
                                        <div className='delivery-svg'>
                                            <IoLocationOutline size={24} />
                                        </div>
                                        <div>
                                            <p>Delivery To</p>
                                            <h3>{selectedOrder?.user_name}</h3>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className='partner-detail d-flex flex-column'>
                                <p>Delivery Partner Details </p>
                                <div className='d-flex justify-content-between partner-container align-items-center'>
                                    <div className='d-flex align-items-center gap-4'>
                                        <div className='avatar-img'>
                                            <img src="https://s3-alpha-sig.figma.com/img/eec8/9617/26f8036592d7892fdc64d9e9578e192f?Expires=1729468800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=U05Q3xdgiWrM0cn9R1G7ElHlf57xjmVYot8HbNKnHx~9gnF750yjufrpxxvln4zbisQ98vW9Q~xyfP8~AVF2THK1WGGYSNtTp31G0Ipt4ruYEmkAe1Vkcn880eC~OEK2ZtExmnalzOdHWw1KdJ2-l3IadFxS1a6~yGQuW4Xqh65tjjVXcN49O2LfcdnKcMnfR7WdrBIpcC10f-eLaOXujgaoUu4KSIf3FCLGGV8aNy8yhwfHE3I8ieOEKDJuCj2sN6CfWrfvoqLbwbc6W9BijE3ZfSuUHhIBNTe6VRvyu83tMaES-ZmiSpSabyTunbicr7N7mtDNnAFeZxRkpiGsUw__" alt="" />
                                        </div>

                                        <div className='partner-prsnl-detail'>
                                            <h2>Tony Stark</h2>
                                            <p>9876543210</p>
                                        </div>

                                    </div>
                                    <div className='partner-phone-svg'> <BiPhoneCall size={25} color='white' /></div>
                                </div>

                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default LiveTrackingModal