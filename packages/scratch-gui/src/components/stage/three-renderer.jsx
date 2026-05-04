import PropTypes from 'prop-types';
import React from 'react';
import * as THREE from 'three';

class ThreeRenderer extends React.Component {
    constructor (props) {
        super(props);
        this.containerRef = React.createRef();
        this.spriteMeshes = {}; 
    }

    componentDidMount () {
        this.initThreeJS();
        this.animate();
    }

    initThreeJS () {
        const {width, height} = this.props;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
        this.camera.position.set(0, 0, 500);

        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor(0x000000, 0); 
        this.renderer.setSize(width, height);
        if (this.containerRef.current) {
            this.containerRef.current.appendChild(this.renderer.domElement);
        }

        this.scene.add(new THREE.AmbientLight(0xffffff, 1));
    }

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);
        if (!this.props.vm || !this.props.vm.runtime) return;

        const runtime = this.props.vm.runtime;

        runtime.targets.forEach(target => {
            if (target.isStage) return;
            let mesh = this.spriteMeshes[target.id];
            if (!mesh) {
                const geometry = new THREE.PlaneGeometry(1, 1);
                const material = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
                mesh = new THREE.Mesh(geometry, material);
                this.scene.add(mesh);
                this.spriteMeshes[target.id] = mesh;
            }
            mesh.position.x = target.x;
            mesh.position.y = target.y;
            mesh.position.z = target.z || 0; 
            mesh.rotation.z = (target.direction - 90) * (-Math.PI / 180);
            mesh.visible = target.visible;
        });

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
