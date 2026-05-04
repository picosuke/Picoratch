import PropTypes from 'prop-types';
import React from 'react';
import * as THREE from 'three';

class ThreeRenderer extends React.Component {
    constructor (props) {
        super(props);
        this.containerRef = React.createRef();
    }

    componentDidMount () {
        const {width, height} = this.props;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
        this.camera.position.set(0, 0, 500);

        // 背景を透明にする設定
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor(0x000000, 0); 
        this.renderer.setSize(width, height);
        this.containerRef.current.appendChild(this.renderer.domElement);

        // 2D画面を3D空間に映し出す板（猫を表示する用）
        const geometry = new THREE.PlaneGeometry(width, height);
        this.texture = new THREE.CanvasTexture(this.props.vm.runtime.renderer.canvas);
        const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
        this.screenMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.screenMesh);

        this.animate();
    }

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);
        if (this.texture) this.texture.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    }

    render () {
        return <div ref={this.containerRef} style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'none'}} />;
    }
}

ThreeRenderer.propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    vm: PropTypes.object
};

export default ThreeRenderer;
