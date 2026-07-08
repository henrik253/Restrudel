setcpm(96/4)
$: s("bd ~ sd ~").bank("linndrum").gain(.8).release(.3)
$: note("d5 c#5@2 d#5@4 ~").s("sawtooth").lpf(2000).room(.5).delay(.3).delaytime(.125).gain(.4)
$: s("cymbal ~ ~ ~").gain(.3)
