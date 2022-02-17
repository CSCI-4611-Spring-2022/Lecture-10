import * as THREE from 'three'
import { GUI } from 'dat.gui'
import { GraphicsApp } from './GraphicsApp'


export class TextureMappingApp extends GraphicsApp
{ 
    private debugMode : boolean;
    private mouseDrag : boolean;
    private cameraOrbitX : number;
    private cameraOrbitY : number;
    private cameraDistance : number;
    
    private debugMaterial : THREE.MeshBasicMaterial;
    private cylinder : THREE.Group;

    constructor()
    {
        // Pass in the aspect ratio to the constructor
        super(1920/1080);

        this.debugMode = false;
        this.mouseDrag = false;
        this.cameraOrbitX = 0;
        this.cameraOrbitY = 0;
        this.cameraDistance = 0;

        this.debugMaterial = new THREE.MeshBasicMaterial();
        this.cylinder = new THREE.Group();
    }

    createScene() : void
    {
        // Setup camera
        this.cameraDistance = 4;
        this.updateCameraOrbit();

        // Create an ambient light
        var ambientLight = new THREE.AmbientLight('white', 0.3);
        this.scene.add(ambientLight);

        // Create a directional light
        var directionalLight = new THREE.DirectionalLight('white', .6);
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight)

        // Create the skybox material
        var skyboxMaterial = new THREE.MeshBasicMaterial();
        skyboxMaterial.side = THREE.BackSide;
        skyboxMaterial.color.set('black');

        // Create a skybox
        var skybox = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), skyboxMaterial);
        this.scene.add(skybox);

        // Put the debug material into wireframe mode
        this.debugMaterial.wireframe = true;

        // Add the cylinder to the scene
        this.cylinder.add(this.createCylinderMesh());
        this.scene.add(this.cylinder);

        // Create the GUI
        var gui = new GUI();
        var controls = gui.addFolder('Controls');
        controls.open();

        // Create a GUI control for the debug mode and add a change event handler
        var debugController = controls.add(this, 'debugMode');
        debugController.name('Debug Mode');
        debugController.onChange((value: boolean) => { this.toggleDebugMode(value) });

    }

    private createCylinderMesh() : THREE.Mesh
    {
        var vertices : Array<THREE.Vector3> = [];
        var normals : Array<number> = [];
        var indices : Array<number> = [];

        var increment = 45 * Math.PI / 180;
        var totalRepititions = (2 * Math.PI) / increment; 
        for(let i=0; i < totalRepititions; i++)
        {
            var angle = i * increment;
            vertices.push(new THREE.Vector3(Math.cos(angle), 1, Math.sin(angle)));
            vertices.push(new THREE.Vector3(Math.cos(angle), -1, Math.sin(angle)));
            vertices.push(new THREE.Vector3(Math.cos(angle+increment), 1, Math.sin(angle+increment)));
            vertices.push(new THREE.Vector3(Math.cos(angle+increment), -1, Math.sin(angle+increment)));

            normals.push(Math.cos(angle), 0, Math.sin(angle));
            normals.push(Math.cos(angle), 0, Math.sin(angle));
            normals.push(Math.cos(angle+increment), 0, Math.sin(angle+increment));
            normals.push(Math.cos(angle+increment), 0, Math.sin(angle+increment));

            indices.push(i*4, i*4+2, i*4+1);
            indices.push(i*4+1, i*4+2, i*4+3);
        }
        
        var cylinderMesh = new THREE.Mesh();
        cylinderMesh.geometry.setFromPoints(vertices);
        cylinderMesh.geometry.setIndex(indices);
        cylinderMesh.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

        var cylinderMaterial = new THREE.MeshLambertMaterial();
        cylinderMaterial.color.set('green');
        cylinderMesh.material = cylinderMaterial;

        return cylinderMesh;
    }

    update(deltaTime : number) : void
    {
       
    }

    // Mouse event handlers for wizard functionality
    onMouseDown(event: MouseEvent) : void 
    {
        this.mouseDrag = true;
    }

    // Mouse event handlers for wizard functionality
    onMouseUp(event: MouseEvent) : void
    {
        this.mouseDrag = false;
    }

    // Mouse event handlers for wizard functionality
    onMouseMove(event: MouseEvent) : void
    {
        if(this.mouseDrag)
        {
            this.cameraOrbitX += event.movementX * Math.PI / 180;
            this.cameraOrbitY += event.movementY * Math.PI / 180;
            this.updateCameraOrbit();
        }
    }

    private updateCameraOrbit() : void
    {
        var rotationMatrix = new THREE.Matrix4().makeRotationY(-this.cameraOrbitX);
        rotationMatrix.multiply(new THREE.Matrix4().makeRotationX(-this.cameraOrbitY));

        this.camera.position.set(0, 0, this.cameraDistance);
        this.camera.applyMatrix4(rotationMatrix);

        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 1, 0);
    }

    private toggleDebugMode(debugMode: boolean) : void
    {
        this.cylinder.children.forEach((elem: THREE.Object3D) => {
            if(elem instanceof THREE.Mesh)
            {
                if(debugMode)
                {
                    elem.userData = {'originalMaterial' : elem.material}
                    elem.material = this.debugMaterial;
                }
                else
                {
                    elem.material = elem.userData['originalMaterial'];
                }
            }
        });
    }
}
