/**
 * A guided tutorial for a front: the engine (createTourEngine), what is remembered, and the
 * geometry of a step. The components are connectinq-ui/tour/TourLayer.vue, TourOffer.vue and
 * TourList.vue.
 */
export { createTourEngine, type TourDefinition, type TourEngine, type TourOptions, type TourStep } from './engine'
export { readMemory, writeMemory, type TourMemory, type TourOutcome } from './memory'
export { blockersAround, lightAround, placeCard, type Box, type View } from './geometry'
