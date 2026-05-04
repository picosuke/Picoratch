import PropTypes from 'prop-types';
import React from 'react';
import * as THREE from 'three';

class ThreeRenderer extends React.Component {
    constructor (props) {
        super(props);
        this.containerRef = React.createRef();
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.cube = null;
    }

    componentDidMount () {
        this.initThreeJS();
        this.animate();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
            this.handleResize();
        }
    }

    componentWillUnmount () {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer && this.containerRef.current) {
            this.containerRef.current.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }

    initThreeJS () {
        const {width, height} = this.props;
        const container = this.containerRef.current;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(2, 2, 5);
        this.camera.lookAt(0, 0, 0);

        // 背景を透明にする設定（猫が見えるようにする）
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // 3D空間の床（グリッド）
        this.scene.add(new THREE.GridHelper(10, 10));

        // 緑の箱
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.y = 0.5;
        this.scene.add(this.cube);

        // 光（ライト）
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    }

    handleResize = () => {
        const {width, height} = this.props;
        if (this.camera && this.renderer) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    };

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        if (this.cube) {
            this.cube.rotation.y += 0.01;
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    };

    render () {
        return (
            <div
                ref={this.containerRef}
                style={{
                    width: this.props.width,
                    height: this.props.height,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10,
                    pointerEvents: 'none' // マウスイベントを後ろのScratchに通す
                }}
            />
        );
    }
}

ThreeRenderer.propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired
};

export default ThreeRenderer;
