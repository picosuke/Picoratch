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
        
        // 3Dカメラの設定
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
        this.camera.position.set(0, 0, 500); // 正面から見る

        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor(0x000000, 0); // 背景を透明に
        this.renderer.setSize(width, height);
        this.containerRef.current.appendChild(this.renderer.domElement);

        // Scratchの画面全体を映し出す板（Plane）を1枚作る
        const geometry = new THREE.PlaneGeometry(width, height);
        // Scratchの2Dキャンバスをそのままテクスチャ（画像）として使う
        this.texture = new THREE.CanvasTexture(this.props.vm.runtime.renderer.canvas);
        const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
        this.screenMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.screenMesh);

        this.animate();
    }

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);
        
        // Scratchの2D画面が更新されたら、3Dのテクスチャも更新する
        if (this.texture) this.texture.needsUpdate = true;

        // もし個別のスプライトをZ方向に動かしたい場合は、
        // ここでスプライトごとの座標（target.z）を計算して処理を分けますが、
        // まずはこの「画面全体が3D空間にある」状態をビルドしましょう。

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
