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
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer && this.containerRef.current) {
            this.containerRef.current.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }

    initThreeJS () {
        const {width, height} = this.props;
        const container = this.containerRef.current;

        this.scene = new THREE.Scene();
        
        // 【重要】背景色を設定する行（this.scene.background = ...）を削除しました。
        // これにより、背景が「透明」になります。

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(2, 2, 5); // カメラを少し斜めに配置
        this.camera.lookAt(0, 0, 0);

        // 【重要】alpha: true に設定することで、後ろの2Dステージが透けて見えるようになります。
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor(0x000000, 0); // 透明度0（完全に透明）に設定
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // 3Dだとわかりやすくするために「床の網目（グリッド）」を追加
        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);

        // キューブの作成
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.y = 0.5; // 床の上に置く
        this.scene.add(this.cube);

        // ライトの追加（これがないと真っ暗になります）
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
            this.cube.rotation.y += 0.01; // くるくる回す
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
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10, // Scratchの2Dキャンバスより手前に表示
                    pointerEvents: 'none' // マウス操作が後ろの猫に届くようにする
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
