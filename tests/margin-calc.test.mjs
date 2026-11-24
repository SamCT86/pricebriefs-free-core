import test from 'node:test';import assert from 'node:assert/strict';import {marginImpact} from '../assets/margin-calc.mjs';
test('illustrative example',()=>assert.deepEqual(marginImpact(199,130,20,500),{before:34500,after:24500,loss:10000,breakEven:705}));
test('reject invalid input',()=>{for(const x of [[0,0,0,1],[10,-1,0,1],[10,1,11,1],[10,1,1,1.2],[10,1,1,NaN],[Infinity,1,0,1]])assert.equal(marginImpact(...x),null)});
test('negative margin has no break even',()=>assert.equal(marginImpact(10,8,3,100).breakEven,null));
test('zero reduction',()=>assert.deepEqual(marginImpact(10,5,0,4),{before:20,after:20,loss:0,breakEven:4}));
