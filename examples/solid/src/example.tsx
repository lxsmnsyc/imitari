import { Imitari } from 'solid-imitari';
import { type JSX, Show, onMount } from 'solid-js';
import exampleImage from './example.jpg?imitari';

interface PlaceholderProps {
  show: () => void;
}

function Placeholder(props: PlaceholderProps): JSX.Element {
  onMount(() => {
    props.show();
  });

  return <div>hello</div>;
}

export function Example(): JSX.Element {
  return (
    <Imitari {...exampleImage} alt="example">
      {(visible, show) => (
        <Show when={visible()}>
          <Placeholder show={show} />
        </Show>
      )}
    </Imitari>
  );
}
