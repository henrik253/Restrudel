setcpm(120/4)

$: s("bd*2 ~").bank("RolandTR909").gain(.5).delay(.28).delaytime(.125).room(.6)

$: s("hh*8").gain("[.2 .13]*4")

$: note("g1 ~ f2 g#2 g2 a#2 d#3 c3 ~ c3 g#2 g1")
  .velocity(.5).s("sawtooth").lpf(700).resonance(4).release(.2).gain(.5)

$: n("~ 12 9 12 ~ ~ 9 12 13 9 8 6 ~ 8 6 8 9 13 12 9 ~ 6 3 4 2 3 1 2")
  .scale("g:minor").velocity(.7).pan(.4).s("square")
  .lpf(2000).resonance(5).delay(.3).gain(.35)
