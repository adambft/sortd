<template>
    <div ref="canvasContainer"></div>
    <button class="btn btn-primary m-4" @click="addBox()">Click me</button>
</template>
  
<script>
import Matter from 'matter-js';
// Basic setup for Matter.js
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

            // Create a renderer
            const render = Render.create({
                element: this.$refs.canvasContainer,
                engine: engine,
                options: {
                    width: 800,
                    height: 600,
                    wireframes: false,
                    background: 'transparent',
                },
            });

            Render.run(render);

            // Create a runner
            const runner = Runner.create();
            Runner.run(runner, engine);

            // Create some bodies
            const ground = Bodies.rectangle(400, 580, 810, 100, { isStatic: true });

            // Add bodies to the world
            World.add(this.world, [ground]);

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

            World.add(this.world, mouseConstraint);

            // Keep the mouse in sync with rendering
            render.mouse = mouse;

            // Example: Adding event listeners (optional)
            Matter.Events.on(mouseConstraint, 'startdrag', function(event) {
                console.log('Start Drag:', event.body);
            });

            Matter.Events.on(mouseConstraint, 'enddrag', function(event) {
                console.log('End Drag:', event.body);
            });

            const pyramid = Composites.pyramid(100, 100, 10, 10 , 0, 0, (x, y) => {
                return Bodies.polygon(x, y, 8, 35, {
                    render: {
                        sprite: {
                            texture: testimg,
                            xScale: 0.5,
                            yScale: 0.5,
                        }
                    },
                });
            });

            Composite.add(this.world, pyramid);            
        },
        addBox() {
            // var x = this.getRandomInt(250, 550);
            var x = 400;
            var y = 0;

            var arr_img = [testimg]

            var random_img_id = this.getRandomInt(0, arr_img.length - 1)

            // Add a new box to the world
            const newBox = Bodies.circle(x, y, 35, {
                render: {
                    sprite: {
                        texture: arr_img[random_img_id],
                        xScale: 0.5,
                        yScale: 0.5,
                    }
                }
            });

            World.add(this.world, newBox);
        },
        getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
    },
};
</script>

<style scoped>
.canvasContainer {
    width: 100%;
    height: 100%;
}
</style>