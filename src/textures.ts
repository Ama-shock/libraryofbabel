
import {TextureLoader, MeshPhongMaterial, MeshLambertMaterial} from 'three';

const loader = new TextureLoader();
export const wood = new MeshPhongMaterial({
    map: loader.load('textures/wood.jpg')
});
export const cloth = new MeshLambertMaterial({
    map: loader.load('textures/cloth2.jpg')
});
export const paper = new MeshLambertMaterial({
    map: loader.load('textures/paper.jpg')
});