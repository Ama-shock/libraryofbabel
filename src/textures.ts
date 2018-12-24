
import {TextureLoader, MeshBasicMaterial} from 'three';

const loader = new TextureLoader();
export const wood = new MeshBasicMaterial({
    map: loader.load('textures/wood.jpg')
});
export const cloth = new MeshBasicMaterial({
    map: loader.load('textures/cloth2.jpg')
});