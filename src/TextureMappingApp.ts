import * as THREE from 'three'
import { GUI } from 'dat.gui'
import { GraphicsApp } from './GraphicsApp'


export class TextureMappingApp extends GraphicsApp
{ 
    // State variables
    private debugMode : boolean;
    private mouseDrag : boolean;

    // Camera parameters
    private cameraOrbitX : number;
    private cameraOrbitY : number;
    private cameraDistance : number;

    // Light parameters
    private lightOrbitX : number;
    private lightOrbitY : number;
    private lightIntensity : number;
    
    // Objects and materials
    private debugMaterial : THREE.MeshBasicMaterial;
    private light : THREE.DirectionalLight;
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

        this.lightOrbitX = 0;
        this.lightOrbitY = 0;
        this.lightIntensity = 0;

        this.debugMaterial = new THREE.MeshBasicMaterial();
        this.light = new THREE.DirectionalLight();
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
        this.light.color = new THREE.Color('white');
        this.lightIntensity = 1;
        this.lightOrbitX = -22.5;
        this.lightOrbitY = 45;
        this.updateLightParameters();
        this.scene.add(this.light)

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
        var lightXController = controls.add(this, 'lightOrbitX', -180, 180);
        lightXController.name('Light Orbit X');
        lightXController.onChange((value: number) => { this.updateLightParameters()});

        var lightYController = controls.add(this, 'lightOrbitY', -90, 90);
        lightYController.name('Light Orbit Y');
        lightYController.onChange((value: number) => { this.updateLightParameters()});

        var lightYController = controls.add(this, 'lightIntensity', 0, 2);
        lightYController.name('Light Intensity');
        lightYController.onChange((value: number) => { this.updateLightParameters()});


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
        if((event.target! as Element).localName == "canvas")
        {
            this.mouseDrag = true;
        }
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
            this.cameraOrbitX += event.movementX;
            this.cameraOrbitY += event.movementY;
            this.updateCameraOrbit();
        }
    }

    private updateCameraOrbit() : void
    {
        var rotationMatrix = new THREE.Matrix4().makeRotationY(-this.cameraOrbitX * Math.PI / 180);
        rotationMatrix.multiply(new THREE.Matrix4().makeRotationX(-this.cameraOrbitY * Math.PI / 180));

        this.camera.position.set(0, 0, this.cameraDistance);
        this.camera.applyMatrix4(rotationMatrix);

        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 1, 0);
    }

    private updateLightParameters() : void
    {
        var rotationMatrix = new THREE.Matrix4().makeRotationY(this.lightOrbitX * Math.PI / 180);
        rotationMatrix.multiply(new THREE.Matrix4().makeRotationX(-this.lightOrbitY * Math.PI / 180));

        this.light.position.set(0, 0, 10);
        this.light.applyMatrix4(rotationMatrix);

        this.light.intensity = this.lightIntensity;
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
