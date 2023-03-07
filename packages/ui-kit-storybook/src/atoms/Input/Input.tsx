import {FC, memo, useRef} from 'react';
import {IMaskInput} from 'react-imask';
import cn from 'classnames';
import IMask from 'imask';

import * as styled from './Input.styled';

export interface InputPropsInterface {
  opts: IMask.AnyMaskedOptions;
  value?: string | number | null;
  placeholder?: string;
  size?: 'normal' | 'small';
  disabled?: boolean;
  danger?: boolean;
  wide?: boolean;
  onChange: (value: string) => void;
}

const Input: FC<InputPropsInterface> = ({
  opts,
  value,
  placeholder,
  disabled,
  danger,
  wide,
  size = 'normal',
  onChange
}) => {
  const ref = useRef(null);
  const inputRef = useRef(null);

  return (
    <styled.Container data-testid="Input-test">
      <IMaskInput
        ref={ref}
        inputRef={inputRef}
        {...opts}
        value={value || value === 0 ? `${value}` : null}
        lazy={!(value || value === 0)} // for postfix
        // @ts-ignore
        placeholder={placeholder}
        disabled={disabled}
        className={cn(size, danger && 'danger', wide && 'wide')}
        onAccept={(_, {unmaskedValue}) => {
          console.log(unmaskedValue);
          onChange(unmaskedValue);
        }}
      />
    </styled.Container>
  );
};

export default memo(Input);
