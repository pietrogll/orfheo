import {Image, Transformation} from 'cloudinary-react';
import  React from 'react'


export default function CloudinaryImage ({ publicId, imgSetting }) {
  return (
    <Image cloudName='hxgvncv7u' publicId={publicId} secure='true'>
      <Transformation {...imgSetting} />
    </Image>
  )
}