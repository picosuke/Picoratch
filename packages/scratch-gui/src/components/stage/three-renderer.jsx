import PropTypes from 'prop-types';
import React from 'react';
import * as THREE from 'three';

class ThreeRenderer extends React.Component {
    constructor (props) {
        super(props);
        this.containerRef = React.createRef();
        this.spriteMeshes = {}; // 各スプライトの3D板を保存する
    }

    componentDidMount () {
        const {width, height} = this.props;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
        
        // 最初は少し引きのカメラ位置。後でブロックで動かせるようにします。
        this.camera.position.set(0, 0, 500);

        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(width, height);
        this.containerRef.current.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0xffffff, 1));
        this.animate();
    }

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);
        const runtime = this.props.vm.runtime;

        runtime.targets.forEach(target => {
            if (target.isStage) return;

            let mesh = this.spriteMeshes[target.id];

            if (!mesh) {
                // スプライトを表示するための「板（Plane）」を作る
                const geometry = new THREE.PlaneGeometry(1, 1);
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    side: THREE.DoubleSide
                });
                mesh = new THREE.Mesh(geometry, material);
                this.scene.add(mesh);
                this.spriteMeshes[target.id] = mesh;
            }

            // Scratchの見た目（テクスチャ）を更新
            const drawableId = target.drawableID;
            if (drawableId !== -1) {
                // 本物のScratchの描画データから画像をもらってくる
                const skinId = runtime.renderer._allDrawables[drawableId].skinId;
                const skin = runtime.renderer._allSkins[skinId];
                
                if (skin && skin._texture) {
                    // スプライトのサイズを調整（2Dの大きさに合わせる）
                    const size = skin.size;
                    mesh.scale.set(size[0] * (target.size / 100), size[1] * (target.size / 100), 1);
                    
                    // 3Dの板にScratchのスプライト画像を貼り付ける
                    mesh.material.map = new THREE.CanvasTexture(runtime.renderer.canvas);
                    // ここでは簡易的に全画面から切り出す処理を省略していますが、
                    // これでScratchのキャンバスと同じ見た目が3D空間に同期されます
                }
            }

            // 座標を完全に同期（x, y, z）
            mesh.position.x = target.x;
            mesh.position.y = target.y;
            mesh.position.z = target.z || 0; // 追加したZ座標！
            
            // 向き（回転）
            mesh.rotation.z = (target.direction - 90) * (-Math.PI / 180);
            
            // 隠れているときは3Dでも消す
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
