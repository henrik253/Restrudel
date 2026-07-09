setcpm(110)

$: s("gm_electric_guitar_clean:2 pulse").struct("x*4").gain(0.40)
$: s("rd*3 my_sound EmuDrumulator_oh brakedrum:1").room(.2).delay(.8).delaytime(".75").delayfeedback(.4).gain(.5)
$: s("clavisynth sd").gain(0.90).room(.2)
