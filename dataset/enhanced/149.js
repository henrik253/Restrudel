setcpm(124/4)

$: s("bd*4 ~ sd ~").bank("RolandTR909").gain(.85).lpf(2500).room(.4)

$: s("hh*4 ~").lpf(4000).hpf(2000).gain(.2)

$: note("c4 c#4 d#4 f4 c#4@2 d#4@2 ~ ~ c#4 c4 c#4 d#4 f4 d#4 g#3@4").s("supersaw")
  .lpf(3000).resonance(5).release(.15).delay(.3).room(.3).gain(.4)

$: note("<c2 g1 eb2 bb1>").s("sawtooth").lpf(600).release(.25).gain(.5)
