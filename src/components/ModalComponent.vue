<template>

    <teleport to="body">
        <div class="modal fade show " tabindex="-1" style="display: block;"  :style="{'z-index': zIndex + 5} ">
            <div class="modal-dialog modal-dialog-centered" :class="`modal-${size}`">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{title}}</h5>
                        <button type="button" @click="$emit('modalClose')" class="btn-close"
                                aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </div>


        <div class="modal-backdrop fade show" :style="{'z-index': zIndex} "></div>
    </teleport>

</template>

<script>
    export default {
        name: "ModalComponent",
        props: {
            "title": {
                type: String,
                default: () => {
                    return '';
                }
            },
            "size": {
                type: String,
                default: () => {
                    return 'lg';
                }
            },
            "zIndex": {
                type: Number,
                default: () => {
                    return 1050;
                }
            }
        },
        emits: ['modalClose'],
        mounted() {
            //this.$store.commit('app/increaseOpenModalCount');
        },
        unmounted() {
            //this.$store.commit('app/decreaseOpenModalCount');
        }
    }
</script>

<style scoped>

    /*
    .modal-active {
        display: block;
    }
    */

</style>