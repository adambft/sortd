<template>
    <div ref="canvasContainer" id="canvasContainer" class="bg-light">
        <div id="innerCanvasHome" class="py-3 ps-4 mt-5">
            <div>
                <h1 class="mb-4">Do Your Spotify Playlists Look Like This?</h1>
                <p>Dont be a lazy piece of shit and start sorting your Spotify playlist today you lazy motherfucker</p>
            </div>
        </div>
    </div>
</template>
  
<script>
import Matter from 'matter-js';
const { Engine, Render, Runner, Bodies, World, Mouse, MouseConstraint, Composite, Composites } = Matter;

import testimg from '../assets/logos/Favicon/SVG/favicon_color.svg'

export default {
    data() {
        return {
            engine: null,
            world: null,
        };
    },
    mounted() {
        this.initializeMatter();
    },
    methods: {
        initializeMatter() {
            // Create an engine
            this.engine = Engine.create();
            this.world = this.engine.world;

            var engine = this.engine;
            var world = this.world;
            var matterContainer = this.$refs.canvasContainer;
            
            // Settings
            const THICCNESS = 1000;
            var num_rows = 7;
            var num_cols = 11;
            var e_body_size = matterContainer.clientWidth / 4 / num_cols;
            var pyramid_x = (matterContainer.clientWidth) - (num_cols * e_body_size * 2);
            var pyramid_x_end = matterContainer.clientWidth;
            var pyramid_y = (matterContainer.clientHeight) - (num_rows * e_body_size * 2);
            var holder_size = 50;

            // Set gravity
            engine.gravity.scale = 0.001;

            // Create a renderer
            const render = Render.create({
                element: matterContainer,
                engine: engine,
                options: {
                    width: matterContainer.clientWidth,
                    height: matterContainer.clientHeight,
                    background: 'transparent',
                    wireframes: false,
                    showAngleIndicator: false,
                },
            });

            // Run the renderer
            Render.run(render);

            // Create a runner
            const runner = Runner.create();

            // Run the engine
            Runner.run(runner, engine);

            // Create bodies
            const ground = Bodies.rectangle(
                matterContainer.clientWidth / 2,
                matterContainer.clientHeight + THICCNESS / 2,
                10000,
                THICCNESS, { 
                    isStatic: true,
                    render: {
                        fillStyle: 'transparent',
                    }
                }
            );

            const leftWall = Bodies.rectangle(
                0 - THICCNESS / 2,
                matterContainer.clientHeight / 2,
                THICCNESS,
                10000, {
                    isStatic: true,
                    render: {
                        fillStyle: 'transparent',
                    }
                }
            );

            const rightWall = Bodies.rectangle(
                matterContainer.clientWidth + THICCNESS / 2,
                matterContainer.clientHeight / 2,
                THICCNESS,
                10000, {
                    isStatic: true,
                    render: {
                        fillStyle: 'transparent',
                    }
                }
            );

            const leftHolder = Bodies.rectangle(
                pyramid_x - holder_size/2,
                matterContainer.clientHeight,
                holder_size,
                holder_size, {
                    isStatic: true,
                    render: {
                        fillStyle: 'transparent',
                    }
                }
            );

            const rightHolder = Bodies.rectangle(
                pyramid_x_end + holder_size/2,
                matterContainer.clientHeight,
                holder_size,
                holder_size, {
                    isStatic: true,
                    render: {
                        fillStyle: 'transparent',
                    }
                }
            );

            // Add bodies to the world
            World.add(this.world, [ground, leftWall, rightWall, leftHolder, rightHolder]);

            // Resize canvas to fit window when window is resized
            window.addEventListener('resize', () => {
                render.canvas.width = matterContainer.clientWidth;
                render.canvas.height = matterContainer.clientHeight;

                Matter.Body.setPosition(
                    ground,
                    Matter.Vector.create(
                        matterContainer.clientWidth / 2,
                        matterContainer.clientHeight + THICCNESS / 2
                    )
                );

                Matter.Body.setPosition(
                    leftWall,
                    Matter.Vector.create(
                        0 - THICCNESS / 2,
                        matterContainer.clientHeight / 2
                    )
                );

                Matter.Body.setPosition(
                    rightWall,
                    Matter.Vector.create(
                        matterContainer.clientWidth + THICCNESS / 2,
                        matterContainer.clientHeight / 2
                    )
                );

                Matter.Body.setPosition(
                    leftHolder,
                    Matter.Vector.create(
                        pyramid_x - holder_size,
                        matterContainer.clientHeight
                    )
                );

                Matter.Body.setPosition(
                    rightHolder,
                    Matter.Vector.create(
                        pyramid_x_end + holder_size,
                        matterContainer.clientHeight
                    )
                );
            });

            // Add mouse control
            const mouse = Mouse.create(render.canvas);
            const mouseConstraint = MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: false
                    }
                }
            });

            // Allow scrolling when mouse is over the canvas
            mouseConstraint.mouse.element.removeEventListener('mousewheel', mouseConstraint.mouse.mousewheel);
            mouseConstraint.mouse.element.removeEventListener('wheel', mouse.mousewheel);
            mouseConstraint.mouse.element.removeEventListener('DOMMouseScroll', mouseConstraint.mouse.mousewheel);

            World.add(world, mouseConstraint);

            // Keep the mouse in sync with rendering
            render.mouse = mouse;

            // Adding a pyramid of bodies
            const pyramid = Composites.pyramid(pyramid_x, pyramid_y, num_cols, num_rows , 0, 0, (x, y) => {
                const e_body =  Bodies.circle(x, y, e_body_size, {
                    render: {
                        sprite: {
                            texture: testimg,
                            xScale: 0.4,
                            yScale: 0.4,
                        },
                        friction: 0.5,
                    },
                });

                // Randomly set the rotation of the body
                const randomAngle = Math.random() * Math.PI * 2; // Random angle between 0 and 2*PI radians (0 to 360 degrees)
                Matter.Body.rotate(e_body, randomAngle);

                return e_body;
            });

            Composite.add(world, pyramid);            
        },
    },
};
</script>

<style scoped>
#canvasContainer {
    width: 100%;
    height: 400px;
    position: relative;
}

#innerCanvasHome {
    position: absolute;
    width: 50%;
}

/* Override for mobile devices */
@media (max-width: 768px) {
    #canvasContainer {
        height: 300px;
    }
}
</style>