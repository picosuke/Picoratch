import PropTypes from 'prop-types';
import React from 'react';
import * as THREE from 'three';

class ThreeRenderer extends React.Component {
    constructor (props) {
        super(props);
        this.containerRef = React.createRef();
        this.meshes = {}; // スプライトごとの3Dモデルを保存する箱
    }

    componentDidMount () {
        const {width, height} = this.props;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 200, 400); // 俯瞰（ふかん）で見下ろす位置
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(width, height);
        this.containerRef.current.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.GridHelper(480, 10)); // Scratchの幅に合わせた床
        
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 500, 0);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));

        this.animate();
    }

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        const runtime = this.props.vm.runtime;
        const targets = runtime.targets;

        // Scratchのスプライト一覧を見て、3D空間に反映させる
        targets.forEach(target => {
            if (target.isStage) return; // ステージは無視

            let mesh = this.meshes[target.id];

            // まだ3Dの体がなければ作る（とりあえず立方体）
            if (!mesh) {
                const geometry = new THREE.BoxGeometry(20, 20, 20);
                const material = new THREE.MeshPhongMaterial({color: 0x4c97ff});
                mesh = new THREE.Mesh(geometry, material);
                this.scene.add(mesh);
                this.meshes[target.id] = mesh;
            }

            // Scratchの座標 (x, y, z) を 3D座標にセット！
            mesh.position.x = target.x;
            mesh.position.y = target.y;
            mesh.position.z = target.z || 0; // さっき追加した z座標
            
            // 向きも合わせる
            mesh.rotation.z = (target.direction - 90) * (Math.PI / 180);
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
    vm: PropTypes.object // vmを受け取る
};

export default ThreeRenderer;
