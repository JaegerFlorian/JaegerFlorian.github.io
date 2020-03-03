import React from 'react';
import useImage from 'use-image';
import { Stage, Layer, Transformer, Image as KonvaImage } from 'react-konva';
// import lamp from './lamp.png';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const query = gql`
  query query {
    products(first: 1, query: "title:'Ecoled Blade One'") {
      edges {
        node {
          id
          title
          images(first: 1) {
            edges {
              node {
                originalSrc
              }
            }
          }
        }
      }
    }
  }
`;

const Lamp = ({ data, shapeProps, isSelected, onSelect, onChange }) => {
  let lampUrl;
  if (data) {
    lampUrl = data.products.edges[0].node.images.edges[0].node.originalSrc;
    console.log(lampUrl);
  }
  const [image] = useImage(lampUrl, 'Anonymous');
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  React.useEffect(() => {
    if (isSelected) {
      trRef.current.setNode(shapeRef.current);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        crossOrigin="anonymus"
        fill=""
        image={image}
        onTap={onSelect}
        onClick={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={e => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={e => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const PictureCollage = () => {
  const { data } = useQuery(query);
  const imageUploader = React.useRef(null);
  const canvasStage = React.createRef();
  const lampCanvas = React.useRef();
  const backgroundCanvas = React.useRef();

  let newImage = new Image();

  const [image, setImage] = React.useState(null);
  const [selected, setSelected] = React.useState(false);
  const [shape, setShape] = React.useState({
    x: 10,
    y: 10,
    width: 200,
    height: 320,
  });

  const handleImageUpload = e => {
    setSelected(false);
    let canvas = backgroundCanvas.current;
    let ctx = canvas.getContext('2d');
    newImage.onload = function() {
      newImage.crossOrigin = 'Anonymus';
      setImage(newImage);
      ctx.drawImage(newImage, 0, 0);
    };

    const [file] = e.target.files;
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        newImage.src = e.target.result;
      };
    }
  };

  function downloadURI(uri, name) {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const saveImage = () => {
    let canvasStageSave = canvasStage.current;
    const canvasStageData = canvasStageSave.toDataURL({
      mimeType: 'image/png',
    });
    downloadURI(canvasStageData, 'stage.png');
  };
  console.log(data);

  return (
    <div>
      <Stage
        ref={canvasStage}
        width={window.innerWidth}
        height={window.innerHeight}
      >
        <Layer
          ref={backgroundCanvas}
          onClick={() => {
            setSelected(false);
          }}
          onTap={() => {
            setSelected(false);
          }}
        >
          <KonvaImage image={image} />
        </Layer>
        <Layer ref={lampCanvas}>
          <Lamp
            data={data}
            shapeProps={shape}
            isSelected={selected}
            onSelect={() => {
              setSelected(true);
            }}
            onChange={setShape}
          />
        </Layer>
      </Stage>
      <label
        htmlFor="files"
        className="btn"
        style={{
          border: '1px solid',
          display: 'inline block',
          padding: '6px 12px',
          cursor: 'pointer',
        }}
      >
        Bild hochladen
        <input
          id="files"
          visibility="hidden"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
          ref={imageUploader}
        />
      </label>
      <label
        class="btn"
        style={{
          border: '1px solid',
          display: 'inline block',
          padding: '6px 12px',
          cursor: 'pointer',
        }}
        onClick={saveImage}
      >
        Bild speichern
      </label>
    </div>
  );
};

export default PictureCollage;
