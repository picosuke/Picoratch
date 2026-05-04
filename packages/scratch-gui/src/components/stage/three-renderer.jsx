import PropTypes from 'prop-types';
import React from 'react';
import * as THREE from 'three';

/**
 * ThreeRenderer component initializes and manages a Three.js scene,
 * camera, and renderer. It renders a basic 3D scene with a rotating cube.
 */
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
        // Handle size changes
        if (
            prevProps.width !== this.props.width ||
            prevProps.height !== this.props.height
        ) {
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

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Create a simple cube
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Handle window resize
        window.addEventListener('resize', this.handleResize);
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

        // Rotate the cube
        if (this.cube) {
            this.cube.rotation.x += 0.01;
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
                    left: 0
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
